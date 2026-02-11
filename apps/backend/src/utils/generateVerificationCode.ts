// Генерирует 6-значный код для верификации

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
