import { ApiExtraModels, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActorTypeEnum, ChannelTypeEnum, IActor, INotificationDto } from '@novu/shared';

import { SubscriberResponseDto } from '../../subscribers/dtos';
import { EmailBlock, MessageCTA } from './message-response.dto';

class Actor implements IActor {
  @ApiProperty({
    description: 'The data associated with the actor, can be null if not applicable.',
    nullable: true,
  })
  data: string | null;

  @ApiProperty({
    description: 'The type of the actor, indicating the role in the notification process.',
    enum: [...Object.values(ActorTypeEnum)],
    enumName: 'ActorTypeEnum',
  })
  type: ActorTypeEnum;
}

@ApiExtraModels(EmailBlock, MessageCTA)
export class NotificationDto implements INotificationDto {
  @ApiProperty({
    description: 'Unique identifier for the notification.',
  })
  _id: string;

  @ApiProperty({
    description: 'Identifier for the template used to generate the notification.',
  })
  _templateId: string;

  @ApiProperty({
    description: 'Identifier for the environment where the notification is sent.',
  })
  _environmentId: string;

  @ApiProperty({
    description: 'Identifier for the message template used.',
  })
  _messageTemplateId: string;

  @ApiProperty({
    description: 'Identifier for the organization sending the notification.',
  })
  _organizationId: string;

  @ApiProperty({
    description: 'Unique identifier for the notification instance.',
  })
  _notificationId: string;

  @ApiProperty({
    description: 'Unique identifier for the subscriber receiving the notification.',
  })
  _subscriberId: string;

  @ApiProperty({
    description: 'Identifier for the feed associated with the notification.',
  })
  _feedId: string;

  @ApiProperty({
    description: 'Identifier for the job that triggered the notification.',
  })
  _jobId: string;

  @ApiPropertyOptional({
    description: 'Timestamp indicating when the notification was created.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Timestamp indicating when the notification was last updated.',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Actor details related to the notification, if applicable.',
    type: Actor,
  })
  actor?: Actor;

  @ApiPropertyOptional({
    description: 'Subscriber details associated with this notification.',
    type: SubscriberResponseDto,
  })
  subscriber?: SubscriberResponseDto;

  @ApiProperty({
    description: 'Unique identifier for the transaction associated with the notification.',
  })
  transactionId: string;

  @ApiPropertyOptional({
    description: 'Identifier for the template used, if applicable.',
    nullable: true,
  })
  templateIdentifier: string;

  @ApiPropertyOptional({
    description: 'Identifier for the provider that sends the notification.',
    nullable: true,
  })
  providerId: string;

  @ApiProperty({
    description: 'The main content of the notification.',
  })
  content: string;

  @ApiPropertyOptional({
    description: 'The subject line for email notifications, if applicable.',
    nullable: true,
  })
  subject?: string;

  @ApiProperty({
    description: 'The channel through which the notification is sent.',
    enum: ChannelTypeEnum,
  })
  channel: ChannelTypeEnum;

  @ApiProperty({
    description: 'Indicates whether the notification has been read by the subscriber.',
  })
  read: boolean;

  @ApiProperty({
    description: 'Indicates whether the notification has been seen by the subscriber.',
  })
  seen: boolean;

  @ApiProperty({
    description: 'Indicates whether the notification has been deleted.',
  })
  deleted: boolean;

  @ApiPropertyOptional({
    description: 'Device tokens for push notifications, if applicable.',
    type: [String],
    nullable: true,
  })
  deviceTokens?: string[];

  @ApiProperty({
    description: 'Call-to-action information associated with the notification.',
    type: MessageCTA,
  })
  cta: MessageCTA;

  @ApiProperty({
    description: 'Current status of the notification.',
    enum: ['sent', 'error', 'warning'],
  })
  status: 'sent' | 'error' | 'warning';

  @ApiProperty({
    description: 'The payload that was used to send the notification trigger.',
    type: 'object',
    additionalProperties: true,
    required: false,
  })
  payload?: Record<string, unknown>;

  @ApiProperty({
    description: 'Provider-specific overrides used when triggering the notification.',
    type: 'object',
    additionalProperties: true,
    required: false,
  })
  overrides?: Record<string, unknown>;
}

export class FeedResponseDto {
  @ApiPropertyOptional({
    description: 'Total number of notifications available.',
  })
  totalCount?: number;

  @ApiProperty({
    description: 'Indicates if there are more notifications to load.',
  })
  hasMore: boolean;

  @ApiProperty({
    description: 'Array of notifications returned in the response.',
    type: [NotificationDto],
  })
  data: NotificationDto[];

  @ApiProperty({
    description: 'The number of notifications returned in this response.',
  })
  pageSize: number;

  @ApiProperty({
    description: 'The current page number of the notifications.',
  })
  page: number;
}
