/**
 * Logger to auto-format logs
 * @date 17-5-2023 - 23:07:37
 *
 * @export
 * @param {any} message - Message to log
 */
export function log (...message: any): void {
    console.log(`[${new Date().toLocaleString()}]`, ...message);
}
