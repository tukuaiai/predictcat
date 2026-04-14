const assert = require('assert');

const GoogleTranslateProxy = require('../translation/google-proxy');
const MyMemoryTranslation = require('../translation/mymemory-service');
const GoogleTranslationServiceFree = require('../translation/google-service-free');

const originalEnv = {
  HTTP_PROXY: process.env.HTTP_PROXY,
  HTTPS_PROXY: process.env.HTTPS_PROXY,
  http_proxy: process.env.http_proxy,
  https_proxy: process.env.https_proxy,
  ALL_PROXY: process.env.ALL_PROXY,
  all_proxy: process.env.all_proxy
};

function restoreEnv() {
  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }
    process.env[key] = value;
  });
}

async function main() {
  try {
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;
    process.env.ALL_PROXY = 'http://127.0.0.1:7890';
    delete process.env.all_proxy;

    const googleProxy = new GoogleTranslateProxy();
    assert(googleProxy.agent, 'GoogleTranslateProxy 应该支持 ALL_PROXY');

    const myMemory = new MyMemoryTranslation();
    assert(myMemory.agent, 'MyMemoryTranslation 应该支持 ALL_PROXY');

    const service = new GoogleTranslationServiceFree({
      timeout: 20,
      retryAttempts: 1,
      cache: { enabled: false }
    });

    service.translateWithRetry = () => new Promise(() => {});
    let fallbackCalls = 0;
    service.translateWithFallback = async (text) => {
      fallbackCalls += 1;
      return `ZH:${text}`;
    };

    const startedAt = Date.now();
    const translated = await service.translate('Will Netherlands win the 2026 FIFA World Cup?');
    const duration = Date.now() - startedAt;

    assert.strictEqual(translated, 'ZH:Will Netherlands win the 2026 FIFA World Cup?');
    assert.strictEqual(fallbackCalls, 1, '超时后应该走 fallback');
    assert(duration < 1000, `超时降级耗时过长: ${duration}ms`);

    console.log('✅ 翻译代理与超时降级测试通过');
  } finally {
    restoreEnv();
  }
}

main().catch((error) => {
  console.error('❌ 翻译代理与超时降级测试失败:', error.message);
  process.exit(1);
});
