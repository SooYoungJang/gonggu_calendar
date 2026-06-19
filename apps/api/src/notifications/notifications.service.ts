import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey && !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendGroupBuyApprovedNotification(fcmToken: string, title: string) {
    if (!admin.apps.length) {
      this.logger.warn('Firebase Admin is not configured. Skipping push.');
      return null;
    }

    return admin.messaging().send({
      token: fcmToken,
      notification: {
        title: '새 공동구매 알림',
        body: title,
      },
    });
  }
}
