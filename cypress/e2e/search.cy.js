describe('Поиск по партнерам', () => {
  beforeEach(() => {
    cy.visit('/admin/partners');
  });

  it('Поиск по названию', () => {
    cy.get('input[placeholder="Поиск по названию"]').type('ШинСервіс');
    cy.get('table').contains('ШинСервіс');
  });
});
