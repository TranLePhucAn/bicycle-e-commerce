export function callFakeApi<T>(result: T, delayMs = 600, failRate = 0): Promise<T> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (failRate > 0 && Math.random() < failRate) {
                reject(new Error('Không kết nối được máy chủ, thử lại sau.'));
                return;
            }
            resolve(result);
        }, delayMs);
    });
}