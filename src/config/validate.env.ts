export function validate(config: Record<string, unknown>) {
    const requiredVariables: string[] = [
        //App
        'PORT',

        //Database
        'DATABASE_URL',
        'DATABASE_NAME'
    ]

    const missingVariables = requiredVariables.filter((envVariables) => !config.hasOwnProperty(envVariables))
    const concatMissingVariables = missingVariables.join(', ')

    if(missingVariables.length) {
        throw new Error(`${missingVariables.length} of ${requiredVariables.length} env variables missing ${concatMissingVariables}`)
    }

    return config;
}