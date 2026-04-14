#!/usr/bin/env node

/**
 * Polymarket Signal Bot - 命令行启动器
 * 可打包成 EXE 的版本
 */

const path = require('path');
const fs = require('fs');
const { loadPredictEnv } = require('../shared/env');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 Polymarket Signal Bot');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const envState = loadPredictEnv(__dirname);
const repoEnvPath = path.join(envState.projectRoot, '.env');
const serviceEnvPath = path.join(__dirname, '.env');

if (!fs.existsSync(repoEnvPath) && !fs.existsSync(serviceEnvPath)) {
    console.log('⚠️  配置文件不存在');
    console.log('');
    console.log('请先配置 PredictCat 环境变量：');
    console.log(`1. cp ${path.join(envState.projectRoot, '.env.example')} ${repoEnvPath}`);
    console.log(`2. 或者在当前目录创建 ${serviceEnvPath}`);
    console.log('3. 填入 TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 等配置');
    console.log('');
    console.log('仓库根配置路径:', repoEnvPath);
    console.log('服务局部配置路径:', serviceEnvPath);

    console.log('');
    console.log('配置完成后,请重新运行本程序');
    console.log('');
    process.exit(0);
}

// 启动 Bot
console.log('🚀 启动中...\n');

try {
    require('./bot.js');
} catch (error) {
    console.error('❌ 启动失败:', error.message);
    console.error('');
    console.error('详细错误:');
    console.error(error.stack);
    process.exit(1);
}
