/**
 * Represents a problem with the CAPE config data structure
 * @type {ValidationError}
 */
class ValidationErrors extends Error {
    public issues: Array<string>

    constructor(issues: Array<string>) {
        super(issues.join( ', ')+'.')
        this.issues = issues
        this.name = 'ValidationError'
    }
}

export {ValidationErrors}