import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \Laravel\Cashier\Http\Controllers\WebhookController::handleWebhook
* @route '/stripe/webhook'
*/
export const handleWebhook = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleWebhook.url(options),
    method: 'post',
})

handleWebhook.definition = {
    methods: ["post"],
    url: '/stripe/webhook',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Cashier\Http\Controllers\WebhookController::handleWebhook
* @route '/stripe/webhook'
*/
handleWebhook.url = (options?: RouteQueryOptions) => {
    return handleWebhook.definition.url + queryParams(options)
}

/**
* @see \Laravel\Cashier\Http\Controllers\WebhookController::handleWebhook
* @route '/stripe/webhook'
*/
handleWebhook.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleWebhook.url(options),
    method: 'post',
})

/**
* @see \Laravel\Cashier\Http\Controllers\WebhookController::handleWebhook
* @route '/stripe/webhook'
*/
const handleWebhookForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handleWebhook.url(options),
    method: 'post',
})

/**
* @see \Laravel\Cashier\Http\Controllers\WebhookController::handleWebhook
* @route '/stripe/webhook'
*/
handleWebhookForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handleWebhook.url(options),
    method: 'post',
})

handleWebhook.form = handleWebhookForm

const WebhookController = { handleWebhook }

export default WebhookController