import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios, { AxiosError } from 'axios';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookSecret: string;
  private readonly n8nBaseUrl: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 segundo

  constructor(private config: ConfigService) {
    this.webhookSecret = this.config.get<string>('WEBHOOK_SECRET') || '';
    this.n8nBaseUrl = this.config.get<string>('N8N_WEBHOOK_URL') || 'http://n8n:5678/webhook';

    if (!this.webhookSecret) {
      throw new Error('WEBHOOK_SECRET no está definido');
    }
  }

  /**
   * Emite un evento a n8n con firma HMAC
   */
  async emitEvent(
    eventType: string,
    data: any,
    idempotencyKey: string,
    source: string = 'MenuMS',
  ): Promise<void> {
    const payload = {
      event: eventType,
      version: '1.0',
      idempotency_key: idempotencyKey,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source,
        environment: 'local',
      },
    };

    const rawBody = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Intentar enviar con reintentos
    await this.sendWithRetry(rawBody, signature);
  }

  /**
   * Envía el webhook con reintentos automáticos
   */
  private async sendWithRetry(rawBody: string, signature: string): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await axios.post(
          this.n8nBaseUrl,
          rawBody,
          {
            headers: {
              'X-Signature': signature,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          },
        );

        this.logger.log(`Webhook enviado exitosamente (intento ${attempt})`);
        return;
      } catch (error) {
        const axiosError = error as AxiosError;
        lastError = new Error(
          `Error enviando webhook (intento ${attempt}/${this.maxRetries}): ${axiosError.message}`,
        );

        if (attempt < this.maxRetries) {
          this.logger.warn(`Reintentando en ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay * attempt); // Backoff exponencial
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    this.logger.error(`Error crítico enviando webhook después de ${this.maxRetries} intentos`);
    this.logger.error(lastError?.message);
    // No lanzamos error para no interrumpir el flujo principal
  }

  /**
   * Utilidad para esperar
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
