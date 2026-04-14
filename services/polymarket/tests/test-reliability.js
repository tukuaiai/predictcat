const assert = require('assert');

process.env.POLYMARKET_DISABLE_TELEGRAM_POLLING = '1';

const baseConfig = require('../config/settings');
const PolymarketSignalBot = require('../bot');
const OrderbookDetector = require('../signals/orderbook/detector');
const MessageUpdater = require('../translation/updater');

const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function cloneConfig() {
  const config = JSON.parse(JSON.stringify(baseConfig));
  config.telegram = { ...(config.telegram || {}), token: '' };
  return config;
}

async function testTelegramLimiterSplit() {
  const bot = new PolymarketSignalBot(cloneConfig());
  bot.telegramRateLimiter = {
    channels: {
      send: bot.createTelegramRateLimitChannel('send', {
        minIntervalMs: 0,
        retryPaddingMs: 0,
        maxRetries: 0
      }),
      edit: bot.createTelegramRateLimitChannel('edit', {
        minIntervalMs: 0,
        retryPaddingMs: 0,
        maxRetries: 0
      })
    }
  };

  const order = [];
  const sendPromise = bot.enqueueTelegramCall('send', async () => {
    order.push('send:start');
    await sleep(80);
    order.push('send:end');
    return 'send';
  });

  await sleep(5);

  const editPromise = bot.enqueueTelegramCall('edit', async () => {
    order.push('edit:start');
    order.push('edit:end');
    return 'edit';
  });

  const results = await Promise.all([sendPromise, editPromise]);
  assert.deepStrictEqual(results, ['send', 'edit']);
  assert(order.indexOf('edit:end') < order.indexOf('send:end'), '编辑通道不应被发送通道阻塞');
}

async function testOrderbookDispatchCoalesce() {
  const bot = new PolymarketSignalBot(cloneConfig());
  bot.orderbookDispatchState.running = true;

  bot.enqueueOrderbookSignal({ market: 'M1', seq: 1, timestamp: 1 });
  bot.enqueueOrderbookSignal({ market: 'M1', seq: 2, timestamp: 2 });
  bot.enqueueOrderbookSignal({ market: 'M2', seq: 1, timestamp: 3 });

  assert.strictEqual(bot.orderbookDispatchState.pendingByMarket.size, 2);
  assert.strictEqual(bot.orderbookDispatchState.pendingByMarket.get('M1').seq, 2);
  assert.strictEqual(bot.orderbookDispatchState.replaced, 1);

  const delivered = [];
  bot.sendSignal = async (moduleName, signal) => {
    delivered.push(`${moduleName}:${signal.market}:${signal.seq}`);
  };

  bot.orderbookDispatchState.running = false;
  await bot.flushOrderbookDispatchQueue();

  assert.deepStrictEqual(delivered, ['orderbook:M1:2', 'orderbook:M2:1']);
}

async function testOrderbookLiquidityGate() {
  const detector = new OrderbookDetector({
    minImbalance: 3,
    minDepth: 1000,
    minLiquidity: 20000,
    minPriceImpact: 1,
    cooldown: 0,
    maxSignalsPerHour: 10
  });

  const baseAnalysis = {
    buyDepth: 15000,
    sellDepth: 5000,
    imbalance: 3,
    direction: 'BULLISH',
    priceImpact: 2,
    bestBid: 0.45,
    bestAsk: 0.55,
    midPrice: 0.5,
    spread: 0.1,
    bids: [{ price: 0.45, size: 15000 }],
    asks: [{ price: 0.55, size: 5000 }]
  };

  const rejected = detector.detect('LOW_LIQUIDITY', {
    ...baseAnalysis,
    totalLiquidity: 19000
  });
  assert.strictEqual(rejected, null, '总流动性不足时不应触发信号');

  const accepted = detector.detect('ENOUGH_LIQUIDITY', {
    ...baseAnalysis,
    totalLiquidity: 20000
  });
  assert(accepted, '总流动性达标后应触发信号');
  assert.strictEqual(accepted.totalLiquidity, 20000);
}

async function testMessageUpdaterTransientError() {
  const updater = new MessageUpdater({
    editMessageText: async () => {
      const error = new Error('Client network socket disconnected before secure TLS connection was established');
      error.code = 'ECONNRESET';
      throw error;
    }
  });

  await assert.rejects(
    () => updater.updateWithTranslation(
      1,
      1,
      'Market title',
      '市场标题',
      'orderbook',
      { text: '🏷️ Market title', reply_markup: null }
    ),
    (error) => error && error.code === 'TRANSIENT'
  );
}

async function main() {
  await testTelegramLimiterSplit();
  await testOrderbookDispatchCoalesce();
  await testOrderbookLiquidityGate();
  await testMessageUpdaterTransientError();
  console.log('✅ 可靠性修复测试通过');
}

main().catch((error) => {
  console.error('❌ 可靠性修复测试失败:', error.message);
  process.exit(1);
});
