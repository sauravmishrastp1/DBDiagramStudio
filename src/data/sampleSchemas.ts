// Sample DBML schemas for demonstration

export const ecommerceSample = `// E-Commerce Database Schema

Table users {
  id int [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  password_hash varchar(255) [not null]
  full_name varchar(100)
  created_at timestamp [default: 'now()']
  updated_at timestamp
  Note: 'User accounts and authentication'
}

Table products {
  id int [pk, increment]
  name varchar(200) [not null]
  description text
  price decimal(10,2) [not null]
  stock_quantity int [default: 0]
  category_id int
  created_at timestamp [default: 'now()']
  Note: 'Product catalog'
}

Table categories {
  id int [pk, increment]
  name varchar(100) [not null, unique]
  parent_id int
  description text
}

Table orders {
  id int [pk, increment]
  user_id int [not null]
  status varchar(20) [default: 'pending']
  total_amount decimal(10,2)
  created_at timestamp [default: 'now()']
  shipping_address text
}

Table order_items {
  id int [pk, increment]
  order_id int [not null]
  product_id int [not null]
  quantity int [not null]
  price decimal(10,2) [not null]
}

Table reviews {
  id int [pk, increment]
  product_id int [not null]
  user_id int [not null]
  rating int [not null]
  comment text
  created_at timestamp [default: 'now()']
}

// Relationships
Ref: products.category_id > categories.id
Ref: categories.parent_id > categories.id
Ref: orders.user_id > users.id
Ref: order_items.order_id > orders.id
Ref: order_items.product_id > products.id
Ref: reviews.product_id > products.id
Ref: reviews.user_id > users.id
`;

export const blogSample = `// Blog Platform Schema

Table authors {
  id int [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  bio text
  avatar_url varchar(255)
  created_at timestamp [default: 'now()']
}

Table posts {
  id int [pk, increment]
  author_id int [not null]
  title varchar(255) [not null]
  slug varchar(255) [unique, not null]
  content text [not null]
  excerpt text
  published_at timestamp
  created_at timestamp [default: 'now()']
  updated_at timestamp
  Note: 'Blog posts and articles'
}

Table tags {
  id int [pk, increment]
  name varchar(50) [unique, not null]
  slug varchar(50) [unique, not null]
}

Table post_tags {
  post_id int [not null]
  tag_id int [not null]
  Note: 'Many-to-many relationship'
}

Table comments {
  id int [pk, increment]
  post_id int [not null]
  author_id int
  content text [not null]
  created_at timestamp [default: 'now()']
  parent_id int
  Note: 'Nested comments support'
}

Ref: posts.author_id > authors.id
Ref: post_tags.post_id > posts.id
Ref: post_tags.tag_id > tags.id
Ref: comments.post_id > posts.id
Ref: comments.author_id > authors.id
Ref: comments.parent_id > comments.id
`;

export const socialMediaSample = `// Social Media Platform

Table users {
  id int [pk, increment]
  username varchar(50) [unique, not null]
  email varchar(100) [unique, not null]
  display_name varchar(100)
  bio varchar(500)
  avatar_url varchar(255)
  created_at timestamp [default: 'now()']
}

Table posts {
  id int [pk, increment]
  user_id int [not null]
  content text [not null]
  image_url varchar(255)
  likes_count int [default: 0]
  comments_count int [default: 0]
  created_at timestamp [default: 'now()']
}

Table follows {
  follower_id int [not null]
  following_id int [not null]
  created_at timestamp [default: 'now()']
  Note: 'User follow relationships'
}

Table likes {
  user_id int [not null]
  post_id int [not null]
  created_at timestamp [default: 'now()']
}

Table comments {
  id int [pk, increment]
  post_id int [not null]
  user_id int [not null]
  content text [not null]
  created_at timestamp [default: 'now()']
}

Table messages {
  id int [pk, increment]
  sender_id int [not null]
  recipient_id int [not null]
  content text [not null]
  read_at timestamp
  created_at timestamp [default: 'now()']
}

Ref: posts.user_id > users.id
Ref: follows.follower_id > users.id
Ref: follows.following_id > users.id
Ref: likes.user_id > users.id
Ref: likes.post_id > posts.id
Ref: comments.post_id > posts.id
Ref: comments.user_id > users.id
Ref: messages.sender_id > users.id
Ref: messages.recipient_id > users.id
`;

export const defaultSchema = ecommerceSample;
