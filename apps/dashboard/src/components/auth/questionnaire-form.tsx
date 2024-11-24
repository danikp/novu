import { Button } from '@/components/primitives/button';
import { CardDescription, CardTitle } from '@/components/primitives/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import React, { useState } from 'react';
import { StepIndicator } from './shared';
import { JobTitleEnum, jobTitleToLabelMapper, OrganizationTypeEnum } from '@novu/shared';
import { useForm, Controller } from 'react-hook-form';
import { updateClerkOrgMetadata } from '../../api/organization';
import { hubspotCookie } from '../../utils/cookies';
import { identifyUser } from '../../api/telemetry';
import { useTelemetry } from '../../hooks';
import { TelemetryEvent } from '../../utils/telemetry';
import { useNavigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../utils/routes';

enum CompanySize {
  LESS_THAN_10 = '<10',
  BETWEEN_10_50 = '10-50',
  BETWEEN_51_100 = '51-100',
  MORE_THAN_100 = '100+',
}

interface QuestionnaireFormData {
  jobTitle: JobTitleEnum;
  organizationType: OrganizationTypeEnum;
  companySize?: CompanySize;
}

export function QuestionnaireForm() {
  const { control, watch, handleSubmit } = useForm<QuestionnaireFormData>();
  const track = useTelemetry();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedJobTitle = watch('jobTitle');
  const selectedOrgType = watch('organizationType');
  const companySize = watch('companySize');

  const shouldShowCompanySize =
    (selectedOrgType === OrganizationTypeEnum.COMPANY || selectedOrgType === OrganizationTypeEnum.AGENCY) &&
    !!selectedJobTitle;

  const isFormValid = React.useMemo(() => {
    if (!selectedJobTitle || !selectedOrgType) return false;
    if (shouldShowCompanySize && !companySize) return false;

    return true;
  }, [selectedJobTitle, selectedOrgType, shouldShowCompanySize, companySize]);

  const onSubmit = async (data: QuestionnaireFormData) => {
    setIsSubmitting(true);

    try {
      await updateClerkOrgMetadata({
        companySize: data.companySize,
        jobTitle: data.jobTitle,
        organizationType: data.organizationType,
      });

      const hubspotContext = hubspotCookie.get();

      await identifyUser({
        location: 'web',
        jobTitle: data.jobTitle,
        pageUri: window.location.href,
        pageName: 'Create Organization Form',
        hubspotContext: hubspotContext || '',
        companySize: data.companySize,
        organizationType: data.organizationType,
      });

      track(TelemetryEvent.CREATE_ORGANIZATION_FORM_SUBMITTED, {
        location: 'web',
        jobTitle: data.jobTitle,
        companySize: data.companySize,
      });

      navigate(ROUTES.USECASE_SELECT);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-[564px] px-0 py-[60px]">
        <div className="flex flex-col items-center gap-8">
          <div className="flex w-[350px] flex-col gap-1">
            <div className="flex w-full items-center gap-1.5">
              <div className="flex flex-1 flex-col gap-1">
                <StepIndicator step={2} />
                <CardTitle className="text-lg font-medium text-[#232529]">
                  Help us personalise your experience
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-xs text-[#99A0AE]">
              This helps us set up Novu to match your goals and plan features and improvements.
            </CardDescription>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex w-[350px] flex-col gap-8">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-[4px]">
                <label className="text-xs font-medium text-[#525866]">Job title</label>
                <Controller
                  name="jobTitle"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={`shadow-regular-shadow-x-small h-[32px] w-full border border-[#E1E4EA] ${field.value ? 'text-[#0E121B]' : 'text-[#99A0AE]'}`}
                      >
                        <SelectValue placeholder="What's your nature of work" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(jobTitleToLabelMapper).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {selectedJobTitle && (
                <div className="flex flex-col gap-[4px]">
                  <label className="text-xs font-medium text-[#525866]">Organization type</label>
                  <div className="flex flex-wrap gap-[8px]">
                    <Controller
                      name="organizationType"
                      control={control}
                      render={({ field }) => (
                        <>
                          {Object.values(OrganizationTypeEnum).map((type) => (
                            <Button
                              key={type}
                              variant="outline"
                              size="xs"
                              type="button"
                              className={`h-[28px] rounded-full px-3 py-1 text-sm ${
                                field.value === type ? 'border-[#E1E4EA] bg-[#F2F5F8]' : 'border-[#E1E4EA]'
                              }`}
                              onClick={() => field.onChange(type)}
                            >
                              {type}
                            </Button>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>
              )}

              {shouldShowCompanySize && (
                <div className="flex flex-col gap-[4px]">
                  <label className="text-xs font-medium text-[#525866]">Company size</label>
                  <div className="flex flex-wrap gap-[8px]">
                    <Controller
                      name="companySize"
                      control={control}
                      render={({ field }) => (
                        <>
                          {Object.values(CompanySize).map((size) => (
                            <Button
                              key={size}
                              variant="outline"
                              size="xs"
                              type="button"
                              className={`h-[28px] rounded-full px-3 py-1 text-sm ${
                                field.value === size ? 'border-[#E1E4EA] bg-[#F2F5F8]' : 'border-[#E1E4EA]'
                              }`}
                              onClick={() => field.onChange(size)}
                            >
                              {size}
                            </Button>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {isFormValid && (
              <div className="flex flex-col gap-3">
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Get started'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="w-full max-w-[564px] flex-1">
        <img src="/images/auth/ui-org.svg" alt="create-org-illustration" />
      </div>
    </>
  );
}