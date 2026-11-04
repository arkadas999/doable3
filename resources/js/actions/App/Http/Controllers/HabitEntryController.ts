import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HabitEntryController::toggle
* @route '/habits/{habit}/toggle'
*/
export const toggle = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

toggle.definition = {
    methods: ["post"],
    url: '/habits/{habit}/toggle',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HabitEntryController::toggle
* @route '/habits/{habit}/toggle'
*/
toggle.url = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { habit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { habit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            habit: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        habit: typeof args.habit === 'object'
        ? args.habit.id
        : args.habit,
    }

    return toggle.definition.url
            .replace('{habit}', parsedArgs.habit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitEntryController::toggle
* @route '/habits/{habit}/toggle'
*/
toggle.post = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitEntryController::toggle
* @route '/habits/{habit}/toggle'
*/
const toggleForm = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitEntryController::toggle
* @route '/habits/{habit}/toggle'
*/
toggleForm.post = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggle.url(args, options),
    method: 'post',
})

toggle.form = toggleForm

const HabitEntryController = { toggle }

export default HabitEntryController