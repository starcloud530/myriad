/** 代码补全 / FIM。第一期只定合同，渠道后挂。 */
export interface CompleteInput {
  prefix: string;
  suffix?: string;
  max_tokens?: number;
}

export interface CompleteOutput {
  text: string;
}
