describe('GET /customers API', () => {
  const apiBase = Cypress.env('baseUrl')

  it('retorna a lista padrão de clientes com status 200', () => {
    cy.request('GET', `${apiBase}/customers`).then(({ status, body: { customers, pageInfo } }) => {
      expect(status).to.eq(200)
      expect(customers.length).to.be.lte(10)
      expect(pageInfo.currentPage).to.eq(1)
    })
  })

  it('retorna o número correto de clientes baseado no limit', () => {
    cy.request('GET', `${apiBase}/customers?limit=5`).then(({ status, body: { customers } }) => {
      expect(status).to.eq(200)
      expect(customers.length).to.be.lte(5)
    })
  })

  it('retorna clientes f6iltrados por size e industry com status 200', () => {
    cy.request('GET', 
      `${apiBase}/customers?size=Medium&industry=Technology`).
      then(({ status, body: { customers } }) => {
      expect(status).to.eq(200)
      customers.forEach(({ size, industry }) => {
        expect(size).to.eq('Medium')
        expect(industry).to.eq('Technology')
      })
    })
  })

  it('retorna clientes da página correta com status 200', () => {
    cy.request('GET', `${apiBase}/customers?page=2`).then(({ status, body: { pageInfo } }) => {
      expect(status).to.eq(200)
      expect(pageInfo.currentPage).to.eq(2)
    })
  })

  it('classifica corretamente o size com base no número de funcionários', () => {
    cy.request('GET', `${apiBase}/customers?limit=50`).then(({ status, body: { customers } }) => {
      expect(status).to.eq(200)
      customers.forEach(({ employees, size }) => {
        if (employees < 100) expect(size).to.eq('Small')
        else if (employees < 1000) expect(size).to.eq('Medium')
        else if (employees < 10000) expect(size).to.eq('Enterprise')
        else if (employees < 50000) expect(size).to.eq('Large Enterprise')
        else expect(size).to.eq('Very Large Enterprise')
      })
    })
  })

  it('inclui os campos contactInfo e address, mesmo que sejam null', () => {
    cy.request('GET', `${apiBase}/customers`).then(({ status, body: { customers } }) => {
      expect(status).to.eq(200)
      customers.forEach(({ contactInfo, address }) => {
        expect(contactInfo === null || typeof contactInfo === 'object').to.be.true
        expect(address === null || typeof address === 'object').to.be.true
      })
    })
  })

  it('retorna status 400 para size inválido', () => {
    cy.request({
      method: 'GET',
      url: `${apiBase}/customers?size=Gigantic`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })

  it('retorna status 400 para industry inválida', () => {
    cy.request({
      method: 'GET',
      url: `${apiBase}/customers?industry=Food`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })

  it('retorna status 400 para página negativa', () => {
    cy.request({
      method: 'GET',
      url: `${apiBase}/customers?page=-1`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })

  it('retorna status 400 para limit não numérico', () => {
    cy.request({
      method: 'GET',
      url: `${apiBase}/customers?limit=abc`,
      failOnStatusCode: false
    }).then(({ status }) => {
      expect(status).to.eq(400)
    })
  })
})
