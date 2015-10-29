# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151029152755) do

  create_table "commments", force: :cascade do |t|
    t.integer "user_id"
    t.integer "plot_id"
    t.string  "comment"
  end

  create_table "plots", force: :cascade do |t|
    t.integer "post_id"
    t.integer "user_id"
    t.integer "shape_id"
    t.text    "json"
    t.string  "shape"
  end

  create_table "posts", force: :cascade do |t|
    t.integer  "user_id"
    t.datetime "date"
    t.string   "website"
    t.string   "title"
    t.string   "address"
    t.text     "description"
    t.integer  "plot_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username"
    t.string "email"
    t.string "password"
    t.string "fname"
    t.string "lname"
    t.string "website"
    t.string "affiliation"
    t.string "password_confirmation"
    t.string "password_hash"
    t.string "password_salt"
  end

end
