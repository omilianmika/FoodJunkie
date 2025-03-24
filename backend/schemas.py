from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    barcode: Optional[str] = None
    quantity: float
    unit: str
    expiration_date: Optional[datetime] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

class RecipeBase(BaseModel):
    name: str
    description: str
    instructions: str
    prep_time: int
    cook_time: int
    servings: int

class RecipeCreate(RecipeBase):
    ingredient_ids: List[int]
    ingredient_quantities: List[float]
    ingredient_units: List[str]

class Recipe(RecipeBase):
    id: int
    created_at: datetime
    owner_id: int
    ingredients: List[Item]

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    items: List[Item] = []
    recipes: List[Recipe] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None 