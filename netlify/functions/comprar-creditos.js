"use strict";
// Permanently retired. Browser-supplied amounts must never grant credits.
exports.handler = async function () {
    return {
        statusCode: 410,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff'
        },
        body: JSON.stringify({ erro: 'Esta operação não está disponível.' })
    };
};
