import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/habits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\HabitController::index
* @route '/habits'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\HabitController::store
* @route '/habits'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/habits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HabitController::store
* @route '/habits'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::store
* @route '/habits'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::store
* @route '/habits'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::store
* @route '/habits'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\HabitController::reorder
* @route '/habits/reorder'
*/
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/habits/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HabitController::reorder
* @route '/habits/reorder'
*/
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::reorder
* @route '/habits/reorder'
*/
reorder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::reorder
* @route '/habits/reorder'
*/
const reorderForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::reorder
* @route '/habits/reorder'
*/
reorderForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reorder.url(options),
    method: 'post',
})

reorder.form = reorderForm

/**
* @see \App\Http\Controllers\HabitController::update
* @route '/habits/{habit}'
*/
export const update = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/habits/{habit}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\HabitController::update
* @route '/habits/{habit}'
*/
update.url = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{habit}', parsedArgs.habit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::update
* @route '/habits/{habit}'
*/
update.patch = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\HabitController::update
* @route '/habits/{habit}'
*/
const updateForm = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::update
* @route '/habits/{habit}'
*/
updateForm.patch = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\HabitController::restore
* @route '/habits/{habit}/restore'
*/
export const restore = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

restore.definition = {
    methods: ["post"],
    url: '/habits/{habit}/restore',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HabitController::restore
* @route '/habits/{habit}/restore'
*/
restore.url = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return restore.definition.url
            .replace('{habit}', parsedArgs.habit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::restore
* @route '/habits/{habit}/restore'
*/
restore.post = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restore.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::restore
* @route '/habits/{habit}/restore'
*/
const restoreForm = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::restore
* @route '/habits/{habit}/restore'
*/
restoreForm.post = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: restore.url(args, options),
    method: 'post',
})

restore.form = restoreForm

/**
* @see \App\Http\Controllers\HabitController::forceDestroy
* @route '/habits/{habit}/force'
*/
export const forceDestroy = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDestroy.url(args, options),
    method: 'delete',
})

forceDestroy.definition = {
    methods: ["delete"],
    url: '/habits/{habit}/force',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HabitController::forceDestroy
* @route '/habits/{habit}/force'
*/
forceDestroy.url = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return forceDestroy.definition.url
            .replace('{habit}', parsedArgs.habit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::forceDestroy
* @route '/habits/{habit}/force'
*/
forceDestroy.delete = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: forceDestroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\HabitController::forceDestroy
* @route '/habits/{habit}/force'
*/
const forceDestroyForm = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forceDestroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::forceDestroy
* @route '/habits/{habit}/force'
*/
forceDestroyForm.delete = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: forceDestroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

forceDestroy.form = forceDestroyForm

/**
* @see \App\Http\Controllers\HabitController::destroy
* @route '/habits/{habit}'
*/
export const destroy = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/habits/{habit}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HabitController::destroy
* @route '/habits/{habit}'
*/
destroy.url = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{habit}', parsedArgs.habit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HabitController::destroy
* @route '/habits/{habit}'
*/
destroy.delete = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\HabitController::destroy
* @route '/habits/{habit}'
*/
const destroyForm = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\HabitController::destroy
* @route '/habits/{habit}'
*/
destroyForm.delete = (args: { habit: number | { id: number } } | [habit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const HabitController = { index, store, reorder, update, restore, forceDestroy, destroy }

export default HabitController