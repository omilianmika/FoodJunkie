from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from .auth import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.Recipe)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Create recipe
    db_recipe = models.Recipe(
        name=recipe.name,
        description=recipe.description,
        instructions=recipe.instructions,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        servings=recipe.servings,
        owner_id=current_user.id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    # Add ingredients
    for i in range(len(recipe.ingredient_ids)):
        ingredient = db.query(models.Item).filter(
            models.Item.id == recipe.ingredient_ids[i],
            models.Item.owner_id == current_user.id
        ).first()
        if ingredient:
            db_recipe.ingredients.append(ingredient)

    db.commit()
    db.refresh(db_recipe)
    return db_recipe

@router.get("/", response_model=List[schemas.Recipe])
def read_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    recipes = db.query(models.Recipe).filter(models.Recipe.owner_id == current_user.id).offset(skip).limit(limit).all()
    return recipes

@router.get("/recommendations", response_model=List[schemas.Recipe])
def get_recipe_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Get all available ingredients
    available_items = db.query(models.Item).filter(models.Item.owner_id == current_user.id).all()
    available_item_ids = [item.id for item in available_items]

    # Get recipes that can be made with available ingredients
    recipes = db.query(models.Recipe).filter(
        models.Recipe.owner_id == current_user.id
    ).all()

    recommended_recipes = []
    for recipe in recipes:
        recipe_ingredients = [ingredient.id for ingredient in recipe.ingredients]
        if all(ingredient_id in available_item_ids for ingredient_id in recipe_ingredients):
            recommended_recipes.append(recipe)

    return recommended_recipes

@router.get("/random", response_model=schemas.Recipe)
def get_random_recipe(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    import random
    recipes = get_recipe_recommendations(db, current_user)
    if not recipes:
        raise HTTPException(status_code=404, detail="No recipes available with current ingredients")
    return random.choice(recipes)

@router.get("/{recipe_id}", response_model=schemas.Recipe)
def read_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id, models.Recipe.owner_id == current_user.id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id, models.Recipe.owner_id == current_user.id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"} 