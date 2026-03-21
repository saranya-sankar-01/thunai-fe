export interface ApiResult {
  options?: any[];
  displayValue?: string;
  returnValue?: string;
  // can be any shape returned by service
}

export interface FlowStep {
  key: string; // store name to save step result under in context
  action: string; // service method name, e.g. 'loadWorkplaces'
  params?: string[]; // param names pulled from context, in order
  dependsOn?: string; // optional, key of previous step
  pick?: string; // optional path to pick param for later steps (e.g. '0.gid')
}
