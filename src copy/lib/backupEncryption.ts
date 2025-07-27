// Backup encryption utilities
// Note: In a production environment, use proper encryption libraries like crypto-js

export class BackupEncryption {
  // Simple XOR encryption for demonstration (NOT SECURE FOR PRODUCTION)
  // In production, use AES-256-GCM or similar
  private static xorEncrypt(data: string, key: string): string {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(encrypted); // Base64 encode
  }

  private static xorDecrypt(data: string, key: string): string {
    const decoded = atob(data); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  }

  // Generate a simple checksum for integrity verification
  static generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Verify checksum
  static verifyChecksum(data: string, checksum: string): boolean {
    return this.generateChecksum(data) === checksum;
  }

  // Encrypt backup data
  static encryptBackup(data: string, password: string): {
    encrypted: string;
    checksum: string;
    algorithm: string;
  } {
    const checksum = this.generateChecksum(data);
    const encrypted = this.xorEncrypt(data, password);

    return {
      encrypted,
      checksum,
      algorithm: 'XOR-BASE64' // In production, use 'AES-256-GCM'
    };
  }

  // Decrypt backup data
  static decryptBackup(encryptedData: string, password: string): string {
    try {
      return this.xorDecrypt(encryptedData, password);
    } catch (error) {
      throw new Error('Failed to decrypt backup. Invalid password or corrupted data.');
    }
  }

  // Compress data (simple RLE for demonstration)
  static compressData(data: string): {
    compressed: string;
    originalSize: number;
    compressedSize: number;
    algorithm: string;
  } {
    // In production, use pako or similar compression library
    // This is a simple demonstration
    const originalSize = data.length;

    // For now, just return the original data
    // In production, implement proper compression
    return {
      compressed: data,
      originalSize,
      compressedSize: data.length,
      algorithm: 'none' // In production: 'gzip' or 'deflate'
    };
  }

  // Decompress data
  static decompressData(compressed: string): string {
    // In production, use proper decompression
    return compressed;
  }

  // Generate encryption key from password
  static generateKey(password: string, salt: string = 'hfrp-backup'): string {
    // In production, use PBKDF2 or similar
    return password + salt;
  }

  // Validate password strength
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
