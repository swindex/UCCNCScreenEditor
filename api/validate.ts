module.exports = {
    /**
     * Validate user registration data
     * @param {Object} data - User data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validateUserRegistration(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!data.username || typeof data.username !== 'string' || data.username.trim().length === 0) {
            errors.push('Username is required');
        }
        
        if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
            errors.push('Valid email is required');
        }
        
        if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },
    
    /**
     * Validate user login data
     * @param {Object} data - Login data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validateUserLogin(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (!data.email || typeof data.email !== 'string') {
            errors.push('Email is required');
        }
        
        if (!data.password || typeof data.password !== 'string') {
            errors.push('Password is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
