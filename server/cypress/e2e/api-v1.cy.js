describe('GET /customers API', () => {
  const baseUrl = 'http://localhost:3001/customers';

  const validSizes = [
    'Small',
    'Medium',
    'Enterprise',
    'Large Enterprise',
    'Very Large Enterprise'
  ];

  const validIndustries = [
    'Logistics',
    'Retail',
    'Technology',
    'HR',
    'Finance'
  ];

  it('should return default results (page 1, limit 10)', () => {
    cy.request(baseUrl).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.customers).to.have.length.of.at.most(10);
      expect(res.body.pageInfo.currentPage).to.eq(1);
    });
  });

  it('should return correct number of customers with limit param', () => {
    cy.request(`${baseUrl}?limit=5`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.customers.length).to.be.lte(5);
    });
  });

  it('should return filtered results by size and industry', () => {
    const size = 'Medium';
    const industry = 'Technology';
    cy.request(`${baseUrl}?size=${size}&industry=${industry}`).then((res) => {
      expect(res.status).to.eq(200);
      res.body.customers.forEach((c) => {
        expect(c.size).to.eq(size);
        expect(c.industry).to.eq(industry);
      });
    });
  });

  it('should return customers on specified page', () => {
    const page = 2;
    cy.request(`${baseUrl}?page=${page}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.pageInfo.currentPage).to.eq(page);
    });
  });

  it('should classify size correctly based on employee count', () => {
    cy.request(`${baseUrl}?limit=50`).then((res) => {
      res.body.customers.forEach((c) => {
        const emp = c.employees;
        if (emp < 100) expect(c.size).to.eq('Small');
        else if (emp < 1000) expect(c.size).to.eq('Medium');
        else if (emp < 10000) expect(c.size).to.eq('Enterprise');
        else if (emp < 50000) expect(c.size).to.eq('Large Enterprise');
        else expect(c.size).to.eq('Very Large Enterprise');
      });
    });
  });

  it('should return contactInfo and address fields (nullable)', () => {
    cy.request(baseUrl).then((res) => {
      res.body.customers.forEach((c) => {
        expect(c).to.have.property('contactInfo');
        expect(c).to.have.property('address');
      });
    });
  });

  // ==== Error Handling Tests ====

  it('should return 400 for invalid size', () => {
    cy.request({
      url: `${baseUrl}?size=InvalidSize`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('should return 400 for invalid industry', () => {
    cy.request({
      url: `${baseUrl}?industry=InvalidIndustry`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('should return 400 for negative page number', () => {
    cy.request({
      url: `${baseUrl}?page=-1`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it('should return 400 for non-numeric limit', () => {
    cy.request({
      url: `${baseUrl}?limit=abc`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });
});
