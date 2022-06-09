import core from '@actions/core'

export const required = (name: string): string => core.getInput(name, {required: true})

export const optional = (name: string): string | undefined => {
    const value = core.getInput(name, {required: false})
    return value === '' ? undefined : value
}
