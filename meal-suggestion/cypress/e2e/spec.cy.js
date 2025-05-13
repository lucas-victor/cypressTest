describe('Meal Suggestion App', () => {
  const appUrl = 'https://meal-suggestion.s3.eu-central-1.amazonaws.com/index.html';

  beforeEach(() => {
    cy.visit(appUrl);
  });

  it('carrega a página com o botão "Buscar"', () => {
    cy.contains('Refeição vegana 🌱').should('be.visible');
  });

  it('gera uma sugestão de refeição ao clicar no botão', () => {
    cy.contains('Buscar').click();

    // Verifica se o nome da refeição foi carregado
    cy.get('#meal-name').should('exist').and('not.be.empty');

    // Verifica se a imagem da refeição foi carregada
    cy.get('.meal-img img')
      .should('have.attr', 'src')
      .and('include', 'https://www.themealdb.com/images/media/');

    // Verifica se a categoria é exibida
    cy.get('.meal-category').should('exist');

    // Verifica se instruções são exibidas
    cy.get('.meal-instructions').should('exist').and('not.be.empty');

    // Verifica se há uma lista de ingredientes
    cy.get('.meal-ingredients li').should('have.length.greaterThan', 0);
  });

  it('pode gerar múltiplas sugestões sem falhar', () => {
    for (let i = 0; i < 3; i++) {
      cy.contains('Get Meal').click();
      cy.get('.meal-title').should('exist').and('not.be.empty');
    }
  });
});
