require('dotenv').config();

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  if (process.env.NODE_ENV != "test")
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0;');
  await knex('roles').del()
  await knex('roles').insert([
    {id: 1, name: 'admin'},
    {id: 2, name: 'user'},
    {id: 3, name: 'customer'},
  ]);

  if (process.env.NODE_ENV != "test")
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1;');
};
