carameljs
=========

JavaScript client library for calling SugarCRM via ReST interface. See you at the candy bar!

candy.Account.findBy("name","value");

candy.Lead.findBy("first_name","Björn").call(getResults);

candy.Lead.all({
  conditions: { first_name: "LIKE '%Björn%' },
  limit: 10,
  order_by: "last_name"
});