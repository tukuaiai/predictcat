/**
 * Telegram 消息更新器
 *
 * 功能：
 * - 编辑已发送的消息，添加翻译
 * - 保留原有格式和按钮
 * - 处理编辑失败（消息过旧等）
 */

class MessageUpdater {
    constructor(telegramBot) {
        this.bot = telegramBot;

        // 统计
        this.stats = {
            updates: 0,
            successes: 0,
            failures: 0,
            rateLimited: 0,
            transientFailures: 0
        };
    }

    /**
     * 更新消息，添加翻译
     * @param {number} chatId - 聊天ID
     * @param {number} messageId - 消息ID
     * @param {string} originalText - 原始文本
     * @param {string} translatedText - 翻译文本
     * @param {string} signalType - 信号类型 (arbitrage/orderbook)
     * @param {Object} originalMessage - 原始消息对象（包含完整文本和键盘）
     */
    async updateWithTranslation(chatId, messageId, originalText, translatedText, signalType, originalMessage) {
        this.stats.updates++;

        try {
            // 构建新的消息文本（在市场名称行后添加翻译）
            const newText = this.buildUpdatedText(
                originalMessage.text,
                originalText,
                translatedText
            );

            if (!newText || newText === originalMessage.text) {
                console.log('ℹ️ [MessageUpdater] 翻译已存在或无需更新');
                return originalMessage.text;
            }

            // 编辑消息
            await this.bot.editMessageText(newText, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: originalMessage.reply_markup // 保留原有键盘
            });

            this.stats.successes++;

            console.log(
                `✅ [MessageUpdater] 更新成功 (${signalType}): "${originalText.substring(0, 20)}..." → "${translatedText.substring(0, 20)}..."`
            );

            return newText;
        } catch (error) {
            this.stats.failures++;

            const description = error?.response?.body?.description || error.message || '';
            const isRateLimit = description.toLowerCase().includes('too many requests');
            const retryAfter = this.extractRetryAfter(error);

            // 常见错误处理
            if (error.message.includes('message is not modified')) {
                // 消息内容未变化（可能已经有翻译了）
                console.log(`ℹ️ [MessageUpdater] 消息未修改 (可能已有翻译)`);
            } else if (error.message.includes('message to edit not found')) {
                // 消息不存在或已被删除
                console.warn(`⚠️ [MessageUpdater] 消息不存在: ${messageId}`);
            } else if (error.message.includes('message can\'t be edited')) {
                // 消息太旧无法编辑（48小时限制）
                console.warn(`⚠️ [MessageUpdater] 消息过旧无法编辑: ${messageId}`);
            } else if (isRateLimit) {
                this.stats.rateLimited++;
                console.warn(`⚠️ [MessageUpdater] 限频，需等待 ${Math.ceil(retryAfter / 1000)} 秒再试`);
                const rateLimitError = new Error(description || 'Too Many Requests');
                rateLimitError.code = 'RATE_LIMIT';
                rateLimitError.retryAfterMs = retryAfter;
                rateLimitError.originalError = error;
                throw rateLimitError;
            } else if (this.isTransientError(error)) {
                this.stats.transientFailures++;
                const transientError = new Error(description || error.message || '临时网络错误');
                transientError.code = 'TRANSIENT';
                transientError.retryAfterMs = this.extractTransientRetryAfter(error);
                transientError.originalError = error;
                throw transientError;
            } else {
                // 其他错误
                console.error(`❌ [MessageUpdater] 更新失败:`, error.message);
            }

            return null;
        }
    }

    async updateWithTranslationsBatch(chatId, messageId, translations, signalType, originalMessage) {
        this.stats.updates++;

        if (!Array.isArray(translations) || translations.length === 0) {
            return originalMessage.text;
        }

        let newText = originalMessage.text;
        let changed = false;

        for (const item of translations) {
            if (!item || !item.original || !item.translation) {
                continue;
            }
            const updated = this.buildUpdatedText(newText, item.original, item.translation);
            if (updated !== newText) {
                newText = updated;
                changed = true;
            }
        }

        if (!changed) {
            console.log('ℹ️ [MessageUpdater] 批量翻译已存在或无需更新');
            return originalMessage.text;
        }

        try {
            await this.bot.editMessageText(newText, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'Markdown',
                reply_markup: originalMessage.reply_markup
            });

            this.stats.successes++;

            if (signalType) {
                console.log(`✅ [MessageUpdater] 批量更新成功 (${signalType})`);
            } else {
                console.log('✅ [MessageUpdater] 批量更新成功');
            }

            return newText;
        } catch (error) {
            this.stats.failures++;

            const description = error?.response?.body?.description || error.message || '';
            const isRateLimit = description.toLowerCase().includes('too many requests');
            const retryAfter = this.extractRetryAfter(error);

            if (error.message.includes('message is not modified')) {
                console.log(`ℹ️ [MessageUpdater] 批量消息未修改 (可能已有翻译)`);
            } else if (error.message.includes('message to edit not found')) {
                console.warn(`⚠️ [MessageUpdater] 批量更新时消息不存在: ${messageId}`);
            } else if (error.message.includes('message can\'t be edited')) {
                console.warn(`⚠️ [MessageUpdater] 批量更新时消息过旧无法编辑: ${messageId}`);
            } else if (isRateLimit) {
                this.stats.rateLimited++;
                console.warn(`⚠️ [MessageUpdater] 批量限频，需等待 ${Math.ceil(retryAfter / 1000)} 秒再试`);
                const rateLimitError = new Error(description || 'Too Many Requests');
                rateLimitError.code = 'RATE_LIMIT';
                rateLimitError.retryAfterMs = retryAfter;
                rateLimitError.originalError = error;
                throw rateLimitError;
            } else if (this.isTransientError(error)) {
                this.stats.transientFailures++;
                const transientError = new Error(description || error.message || '临时网络错误');
                transientError.code = 'TRANSIENT';
                transientError.retryAfterMs = this.extractTransientRetryAfter(error);
                transientError.originalError = error;
                throw transientError;
            } else {
                console.error(`❌ [MessageUpdater] 批量更新失败:`, error.message);
            }

            return null;
        }
    }

    extractRetryAfter(error) {
        const retryBody = error?.response?.body?.parameters?.retry_after;
        if (retryBody) {
            const parsed = Number(retryBody);
            if (!Number.isNaN(parsed) && parsed > 0) {
                return parsed * 1000;
            }
        }

        const retryHeader = error?.response?.headers?.['retry-after'];
        if (retryHeader) {
            const parsed = Number(retryHeader);
            if (!Number.isNaN(parsed) && parsed > 0) {
                return parsed * 1000;
            }
        }

        return 1000;
    }

    extractTransientRetryAfter(error) {
        const retryAfterMs = Number(error?.retryAfterMs);
        if (Number.isFinite(retryAfterMs) && retryAfterMs > 0) {
            return retryAfterMs;
        }

        return 2000;
    }

    isTransientError(error) {
        const code = String(error?.code || '').toUpperCase();
        const message = String(error?.message || error?.response?.body?.description || '').toLowerCase();

        if ([
            'ECONNRESET',
            'ETIMEDOUT',
            'ESOCKETTIMEDOUT',
            'ECONNABORTED',
            'EAI_AGAIN',
            'UND_ERR_CONNECT_TIMEOUT',
            'UND_ERR_SOCKET'
        ].includes(code)) {
            return true;
        }

        return [
            'socket hang up',
            'network socket disconnected',
            'client network socket disconnected before secure tls connection was established',
            'read etimedout',
            'connect etimedout',
            'fetch failed',
            'other side closed'
        ].some(fragment => message.includes(fragment));
    }

    /**
     * 构建更新后的消息文本
     * 在市场名称行后添加翻译行
     */
    buildUpdatedText(originalText, marketName, translation) {
        const lines = originalText.split('\n');
        const normalizedMarket = this.normalizeLine(marketName);
        const normalizedTranslation = this.normalizeLine(translation);

        const updatedLines = [];
        let inserted = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const normalizedLine = this.normalizeLine(line);

            if (!inserted && normalizedLine && normalizedLine === normalizedMarket) {
                updatedLines.push(line);

                const prefix = this.extractPrefix(line);
                const sanitizedTranslationLine = prefix ? `${prefix}${translation}` : translation;

                let j = i + 1;
                let hasTranslation = false;

                while (j < lines.length) {
                    const candidate = lines[j];
                    const normalizedCandidate = this.normalizeLine(candidate);

                    if (!normalizedCandidate) {
                        break;
                    }

                    if (normalizedCandidate === normalizedTranslation) {
                        if (!hasTranslation) {
                            updatedLines.push(sanitizedTranslationLine);
                            hasTranslation = true;
                        }
                        j++;
                        continue;
                    }

                    break;
                }

                if (!hasTranslation) {
                    updatedLines.push(sanitizedTranslationLine);
                }

                i = hasTranslation ? j - 1 : i;
                inserted = true;
                continue;
            }

            updatedLines.push(line);
        }

        return inserted ? updatedLines.join('\n') : originalText;
    }

    /**
     * 提取行首前缀（emoji / Markdown 符号）
     */
    extractPrefix(line = '') {
        const match = line.match(/^([^A-Za-z0-9\u4e00-\u9fff]*)/u);
        return match ? match[1] : '';
    }

    normalizeLine(line = '') {
        return line
            .replace(/^```.*$/u, '')
            .replace(/^([^A-Za-z0-9\u4e00-\u9fff]*)/u, '')
            .trim();
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const successRate = this.stats.updates > 0
            ? ((this.stats.successes / this.stats.updates) * 100).toFixed(1)
            : 0;

        return {
            updates: this.stats.updates,
            successes: this.stats.successes,
            failures: this.stats.failures,
            rateLimited: this.stats.rateLimited,
            transientFailures: this.stats.transientFailures,
            successRate: `${successRate}%`
        };
    }

    /**
     * 打印统计信息
     */
    printStats() {
        const stats = this.getStats();
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 [MessageUpdater] 统计信息');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`总更新: ${stats.updates}`);
        console.log(`成功: ${stats.successes}`);
        console.log(`失败: ${stats.failures}`);
        console.log(`限频: ${stats.rateLimited}`);
        console.log(`瞬时错误: ${stats.transientFailures}`);
        console.log(`成功率: ${stats.successRate}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

module.exports = MessageUpdater;
