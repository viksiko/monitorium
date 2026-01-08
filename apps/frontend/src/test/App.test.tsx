describe('Frontend React Test', () => {
    it('should verify that 10 + 5 equals 15', () => {
        const total: number = 10 + 5;
        expect(total).toBe(15);
    });

    // Проверка, что JSDOM работает (доступ к window/document)
    it('should have access to browser globals', () => {
        expect(window).toBeDefined();
        expect(document).toBeDefined();
    });
});
