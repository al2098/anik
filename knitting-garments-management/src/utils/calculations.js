export function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.amount, 0);
}