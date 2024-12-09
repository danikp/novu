import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { IActivity, ChannelTypeEnum } from '@novu/shared';
import { IActivityFilters } from '@/api/activity';
import { IActivityFiltersData, IActivityUrlState } from '@/types/activity';

const DEFAULT_DATE_RANGE = '30d';

function parseFilters(searchParams: URLSearchParams): IActivityFilters {
  const result: IActivityFilters = {};

  const channels = searchParams.get('channels')?.split(',').filter(Boolean);
  if (channels?.length) {
    result.channels = channels as ChannelTypeEnum[];
  }

  const templates = searchParams.get('templates')?.split(',').filter(Boolean);
  if (templates?.length) {
    result.templates = templates;
  }

  const transactionId = searchParams.get('transactionId');
  if (transactionId) {
    result.transactionId = transactionId;
  }

  const subscriberId = searchParams.get('subscriberId');
  if (subscriberId) {
    result.subscriberId = subscriberId;
  }

  const dateRange = searchParams.get('dateRange');
  const endDate = new Date(Date.now() - getDateRangeInDays(dateRange || DEFAULT_DATE_RANGE) * 24 * 60 * 60 * 1000);
  result.endDate = endDate.toISOString();

  return result;
}

function getDateRangeInDays(range: string): number {
  switch (range) {
    case '24h':
      return 1;
    case '7d':
      return 7;
    case '30d':
    default:
      return 30;
  }
}

function parseFilterValues(searchParams: URLSearchParams): IActivityFiltersData {
  return {
    dateRange: searchParams.get('dateRange') || DEFAULT_DATE_RANGE,
    channels: (searchParams.get('channels')?.split(',').filter(Boolean) as ChannelTypeEnum[]) || [],
    templates: searchParams.get('templates')?.split(',').filter(Boolean) || [],
    transactionId: searchParams.get('transactionId') || '',
    subscriberId: searchParams.get('subscriberId') || '',
  };
}

export function useActivityUrlState(): IActivityUrlState & {
  handleActivitySelect: (activity: IActivity) => void;
  handleFiltersChange: (data: IActivityFiltersData) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const activityItemId = searchParams.get('activityItemId');

  const handleActivitySelect = useCallback(
    (activity: IActivity) => {
      setSearchParams((prev) => {
        if (activity._id === activityItemId) {
          prev.delete('activityItemId');
        } else {
          prev.set('activityItemId', activity._id);
        }
        return prev;
      });
    },
    [activityItemId, setSearchParams]
  );

  const handleFiltersChange = useCallback(
    (data: IActivityFiltersData) => {
      setSearchParams((prev) => {
        ['channels', 'templates', 'transactionId', 'subscriberId', 'dateRange'].forEach((key) => prev.delete(key));

        if (data.channels?.length) {
          prev.set('channels', data.channels.join(','));
        }
        if (data.templates?.length) {
          prev.set('templates', data.templates.join(','));
        }
        if (data.transactionId) {
          prev.set('transactionId', data.transactionId);
        }
        if (data.subscriberId) {
          prev.set('subscriberId', data.subscriberId);
        }
        if (data.dateRange && data.dateRange !== DEFAULT_DATE_RANGE) {
          prev.set('dateRange', data.dateRange);
        }

        return prev;
      });
    },
    [setSearchParams]
  );

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filterValues = useMemo(() => parseFilterValues(searchParams), [searchParams]);

  return {
    activityItemId,
    filters,
    filterValues,
    handleActivitySelect,
    handleFiltersChange,
  };
}
