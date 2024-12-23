import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { WorkflowOriginEnum } from '@novu/shared';

import { StepEditorProps } from '@/components/workflow-editor/steps/configure-step-template-form';
import { CustomStepControls } from '@/components/workflow-editor/steps/controls/custom-step-controls';
import { TemplateTabs } from '@/components/workflow-editor/steps/template-tabs';
import { ChatEditor } from '@/components/workflow-editor/steps/chat/chat-editor';
import { ChatEditorPreview } from '@/components/workflow-editor/steps/chat/chat-editor-preview';

export const ChatTabs = (props: StepEditorProps) => {
  const { workflow, step } = props;
  const { dataSchema, uiSchema } = step.controls;
  const [tabsValue, setTabsValue] = useState('editor');
  const form = useFormContext();
  const isNovuCloud = !!(workflow.origin === WorkflowOriginEnum.NOVU_CLOUD && uiSchema);
  const isExternal = workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const editorContent = (
    <>
      {isNovuCloud && <ChatEditor uiSchema={uiSchema} />}
      {isExternal && <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />}
    </>
  );

  const previewContent = <ChatEditorPreview workflow={workflow} step={step} formValues={form.getValues()} />;

  return (
    <TemplateTabs
      editorContent={editorContent}
      previewContent={previewContent}
      tabsValue={tabsValue}
      onTabChange={setTabsValue}
    />
  );
};