from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import create_engine
from sqlalchemy.ext.hybrid import hybrid_method

Base = declarative_base()


class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)


class Category(Base):
    __tablename__ = 'category'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(100), nullable=False)

    # Use hybrid method to be able to receive items to be placed
    # as a property of return object
    @hybrid_method
    def serialize(self, items):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'items': items
        }


class Item(Base):
    __tablename__ = 'item'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(200), nullable=False)
    category_id = Column(Integer, ForeignKey('category.id'))
    category = relationship(Category)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship(User)

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category_id': self.category_id,
            'user_id': self.user_id
        }


engine = create_engine('sqlite:///catalog.db')
Base.metadata.create_all(engine)
