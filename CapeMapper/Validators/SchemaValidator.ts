import Ajv from "ajv";
import {injected} from "brandi";
import {TOKENS} from "../tokens";

export class SchemaValidator {
    constructor(
        private ajv: Ajv,
        private schemaData: object
    ) {
    }

    public validate(data: any): Array<string> {
        const validateCapeSchema = this.ajv.compile(this.schemaData)
        if( !validateCapeSchema) {
            return ['Failed to compile schema']
        }
        const valid = validateCapeSchema(data)
        if (!valid ) {
            console.log(  validateCapeSchema.errors )
            return [this.ajv.errorsText( validateCapeSchema.errors )]
        }
        return []
    }

}

injected(SchemaValidator, TOKENS.ajv, TOKENS.schemaData)
