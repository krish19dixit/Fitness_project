export const RATE_LIMITS = {
    FREE:{
        requestsPerHour: 20,
        requestPerDay: 50,
        maxTokenPerRequest: 2000,
        maxTokensPerDay:50000,
    },
    PRO:{
        requestsPerHour: 200,
        requestPerDay: 1000,
        maxTokenPerRequest: 8000,
        maxTokensPerDay:500000,
    },
    ENTERPISE:{
        requestsPerHour: -1,
        requestPerDay: -1,
        maxTokenPerRequest: 16000,
        maxTokensPerDay:-1,
    },
    CUSTOM_API_KEY:{
        requestsPerHour: -1,
        requestPerDay: -1,
        maxTokenPerRequest: 16000,
        maxTokensPerDay:-1,
    },
};