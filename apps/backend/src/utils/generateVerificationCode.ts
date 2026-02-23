// Генерирует 6-значный код для верификации

export function generateVerificationCode(): string {
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('verifyCode', verifyCode);

    return verifyCode;
}
