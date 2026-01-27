import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolExecutor, ToolResult } from './types';
import { getAllTools } from './definitions';
import { jobseekerOperations } from './tools/jobseeker-operations';
import { confidenceBuilder } from './tools/confidence-builder';
import { interviewPrep } from './tools/interview-prep';
import { linkedinPresence } from './tools/linkedin-presence';
import { negotiations } from './tools/negotiations';
import { networking } from './tools/networking';
import { resumes } from './tools/resumes';

export const TOOL_EXECUTORS: Record<string, ToolExecutor> = {
  jobseeker_operations: jobseekerOperations,
  confidence_builder: confidenceBuilder,
  interview_prep: interviewPrep,
  linkedin_presence: linkedinPresence,
  negotiations: negotiations,
  networking: networking,
  resumes: resumes
};

export async function executeTool(
  toolName: string,
  params: any,
  context: { userId: string; careerFile?: string; memories?: any[] }
): Promise<ToolResult> {
  const executor = TOOL_EXECUTORS[toolName];
  
  if (!executor) {
    throw new Error(`Tool ${toolName} not found`);
  }
  
  return await executor(params, context);
}

export const getOpenAIFunctions = () => 
  getAllTools().map(tool => {
    const jsonSchema = zodToJsonSchema(
      tool.functionSchema.parameters, 
      { name: tool.functionSchema.name }
    );
    
    const parameters = (jsonSchema as any).definitions 
      ? jsonSchema.definitions[tool.functionSchema.name] 
      : jsonSchema;
    
    return {
      name: tool.functionSchema.name,
      description: tool.functionSchema.description,
      parameters
    };
  });
