export default {
  financialDataApi: {
    input: './API/FinancialDataApi/openplatform.json',
    output: {
      mode: 'tags-split',
      target: './src/api/financialDataApi.ts',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: './src/api/orvalSendRequest.ts',
          name: 'useSendRequest'
        }
      }
    }
  }
};