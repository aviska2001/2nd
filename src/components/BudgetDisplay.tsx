import React from 'react';
import { BudgetBreakdown } from '../lib/budget-calculator';

interface BudgetDisplayProps {
  budget: BudgetBreakdown;
}

export default function BudgetDisplay({ budget }: BudgetDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const budgetItems = [
    {
      icon: '🏨',
      label: 'Accommodation',
      cost: budget.accommodation.cost,
      description: budget.accommodation.description,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      icon: '🍽️',
      label: 'Meals',
      cost: budget.meals.cost,
      description: budget.meals.description,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      icon: '🎯',
      label: 'Activities',
      cost: budget.activities.cost,
      description: budget.activities.description,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      icon: '🚗',
      label: 'Transportation',
      cost: budget.transportation.cost,
      description: budget.transportation.description,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      icon: '🛍️',
      label: 'Miscellaneous',
      cost: budget.miscellaneous.cost,
      description: budget.miscellaneous.description,
      color: 'bg-gray-50 border-gray-200 text-gray-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">💰</span>
        <h3 className="text-xl font-semibold text-gray-900">Estimated Budget Breakdown</h3>
      </div>

      {/* Total Budget Display */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-green-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(budget.totalTrip)}
          </div>
          <div className="text-lg text-gray-600 mb-2">
            Total Trip Cost
          </div>
          <div className="text-sm text-gray-500">
            {formatCurrency(budget.totalPerDay)} per day • Based on {budget.budgetRange}
          </div>
        </div>
      </div>

      {/* Budget Breakdown Items */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h4>
        {budgetItems.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border-2 p-4 ${item.color} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-semibold">{item.label}</span>
              </div>
              <span className="font-bold text-lg">
                {formatCurrency(item.cost)}
              </span>
            </div>
            <p className="text-sm ml-8 opacity-80">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Budget Tips */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-300">
        <div className="flex items-start">
          <span className="text-xl mr-3 mt-1">💡</span>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Budget Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Prices are estimates based on your selected budget tier and activities</li>
              <li>• Actual costs may vary depending on season, location, and personal choices</li>
              <li>• Consider booking accommodations and popular attractions in advance for better prices</li>
              <li>• Budget an extra 10-20% for unexpected expenses or spontaneous activities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
