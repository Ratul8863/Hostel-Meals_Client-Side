import React from 'react'

function MealCard({ meal }) {
  return (
 <div className="card bg-base-100 shadow-xl">
      <figure><img src={meal.image} alt={meal.title} className="h-48 w-full object-cover" /></figure>
      <div className="card-body">
        <h2 className="card-title">{meal.title}</h2>
        <p>{meal.description}</p>
        <p><strong>Category:</strong> {meal.category}</p>
        <p><strong>Price:</strong> ${meal.price}</p>
        <p><strong>Ingredients:</strong> {meal.ingredients}</p>
      </div>
    </div>
  )
}

export default MealCard