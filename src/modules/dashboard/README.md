# Dashboard Module

Returns a full farm summary: herd stats, production totals, income, expenses, and profit. All metrics default to the current month and can be scoped to any month.

## Endpoints

| Method | Path            | Description           |
| ------ | --------------- | --------------------- |
| `GET`  | `/v1/dashboard` | Get dashboard metrics |

## Query Parameters

| Param   | Format    | Default       | Example          |
| ------- | --------- | ------------- | ---------------- |
| `month` | `YYYY-MM` | current month | `?month=2026-04` |

## Response

```json
{
  "totalActiveCows": 10,
  "pregnantCows": 3,
  "cowsInMilk": 8,
  "todayTotalMilk": "75.50",
  "monthlyMilkTotal": "2250.75",
  "monthlyExpenses": "15000.00",
  "monthlyMilkIncome": "112500.00",
  "profit": "97500.00",
  "milkPerCow": [
    {
      "cowId": "...",
      "tagNumber": "COW-001",
      "breed": "Friesian",
      "totalLitres": "450.25"
    }
  ],
  "expensePerCow": [
    {
      "cowId": "...",
      "tagNumber": "COW-001",
      "breed": "Friesian",
      "totalExpenses": "2500.00"
    }
  ]
}
```

## Metric Definitions

| Metric              | Calculation                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| `totalActiveCows`   | COUNT of cows with `status = 'active'`                                        |
| `pregnantCows`      | COUNT of active cows with a breeding record (`expected_calving_date > today`) |
| `cowsInMilk`        | COUNT of active cows that have a milk_log in the last 7 days                  |
| `todayTotalMilk`    | SUM of `litres` in `milk_logs` where `log_date = today`                       |
| `monthlyMilkTotal`  | SUM of `litres` in `milk_logs` for the selected month                         |
| `monthlyExpenses`   | SUM of `amount` in `expense_logs` for the selected month                      |
| `monthlyMilkIncome` | SUM of `total_amount` in `milk_sales` for the selected month                  |
| `profit`            | `monthlyMilkIncome - monthlyExpenses`                                         |
| `milkPerCow`        | Per-cow SUM of `litres` for the selected month                                |
| `expensePerCow`     | Per-cow SUM of `amount` for the selected month                                |
