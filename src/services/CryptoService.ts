/**
 * CryptoService.ts — Bảo mật API Key bằng Web Crypto API (BYOK)
 * Source: AGENTS.md § Quy Tắc Bất Biến 3
 * Mục tiêu: Không bao giờ lưu plain-text API key vào localStorage.
 * Khóa sẽ được băm PBKDF2 và mã hóa AES-GCM với một "Mật khẩu Cục Bộ"
 * do người dùng thiết lập.
 */

const SALT_SIZE = 16;
const IV_SIZE = 12;
const ITERATIONS = 100000;

export class CryptoService {
  /**
   * Tạo khóa AES-GCM từ mật khẩu người dùng qua PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: new Uint8Array(salt),
        iterations: ITERATIONS,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Mã hóa API Key với một mật khẩu người dùng tự chọn.
   * Trả về định dạng: salt(base64):iv(base64):ciphertext(base64)
   */
  static async encrypt(plainTextApiKey: string, localPassword: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

    const key = await this.deriveKey(localPassword, salt);
    const enc = new TextEncoder();

    const encryptedContent = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(plainTextApiKey)
    );

    const saltB64 = btoa(String.fromCharCode(...salt));
    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));

    return `${saltB64}:${ivB64}:${cipherB64}`;
  }

  /**
   * Giải mã API Key bằng mật khẩu cục bộ.
   */
  static async decrypt(encryptedData: string, localPassword: string): Promise<string> {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) throw new Error('Dữ liệu mã hóa không hợp lệ');

      const salt = Uint8Array.from(atob(parts[0]!), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(parts[1]!), c => c.charCodeAt(0));
      const ciphertext = Uint8Array.from(atob(parts[2]!), c => c.charCodeAt(0));

      const key = await this.deriveKey(localPassword, salt);

      const decryptedContent = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedContent);
    } catch (e) {
      throw new Error('Sai mật khẩu cục bộ hoặc dữ liệu bị hỏng.');
    }
  }

  // --- Utility để localStorage ---
  
  static readonly STORAGE_KEY = 'tuviai_encrypted_apikey';

  static hasStoredKey(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  static saveEncryptedKey(encryptedKey: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, encryptedKey);
    }
  }

  static clearStoredKey(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  static getStoredKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }
}
