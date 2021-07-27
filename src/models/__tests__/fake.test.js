const { Fake } = require('../index')

const { createUser } = require('./helpers/users')

const clearDb = require('./_clearDb')

describe('Base model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Fake.knex()
    knex.destroy()
  })

  it('creates an entity', async () => {
    const user = await createUser()

    const newFake = await Fake.insert({
      userId: user.id,
      status: 'test',
    })

    expect(newFake).toBeDefined()
  })

  it('throws when invalid params in insert', async () => {
    await expect(Fake.insert(1)).rejects.toThrow()
  })

  it('fetches all entities', async () => {
    const user = await createUser()

    await Fake.insert({
      userId: user.id,
      status: 'test',
    })

    const found = await Fake.find({})

    expect(found).toHaveLength(1)
  })

  it('fetches all entities with relations', async () => {
    const user = await createUser()

    await Fake.insert({
      userId: user.id,
      status: 'test',
    })

    const found = await Fake.find({}, { related: 'user' })
    expect(found[0].user.id).toEqual(user.id)
  })

  it('fetches all orderedBy status', async () => {
    const user = await createUser()

    await Fake.insert({
      userId: user.id,
      status: 'a',
    })
    await Fake.insert({
      userId: user.id,
      status: 'b',
    })

    const found = await Fake.find(
      {},
      { orderBy: [{ column: 'status', order: 'desc' }] },
    )

    expect(found[0].status).toEqual('b')
    expect(found[1].status).toEqual('a')
  })

  it('fetches limited amount of entities ', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'd',
    })

    const found = await Fake.find({}, { limit: 2 })

    expect(found).toHaveLength(2)
  })

  it('skips one and fetches two entities ', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'd',
    })

    const found = await Fake.find({}, { limit: 2, offset: 1 })
    expect(found).toHaveLength(2)
    expect(found[0].status).toEqual('b')
    expect(found[1].status).toEqual('d')
  })

  it('skips one and fetches two entities with total count ', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'd',
    })

    const found = await Fake.find({}, { limit: 2, offset: 1, count: '*' })
    expect(found.totalCount).toEqual(3)
    expect(found.entries).toHaveLength(2)
    expect(found.entries[0].status).toEqual('b')
    expect(found.entries[1].status).toEqual('d')
  })

  it('counts total amount of entities ', async () => {
    await Fake.insert({
      status: 'a',
    })
    await Fake.insert({
      status: 'b',
    })
    await Fake.insert({
      status: 'd',
    })

    const amountOfRecords = await Fake.count('id')

    expect(amountOfRecords[0].count).toEqual('3')
  })

  it('throws when invalid params in count', async () => {
    await expect(Fake.count(1)).rejects.toThrow()
  })

  it('throws when invalid params in find', async () => {
    await expect(Fake.find(1)).rejects.toThrow()
  })

  it('fetches one entity by provided id', async () => {
    const newEntity = await Fake.insert({})

    const entity = await Fake.findById(newEntity.id)
    expect(entity).toBeDefined()
  })

  it('throws when invalid params in findById', async () => {
    await expect(Fake.findById(false)).rejects.toThrow()
  })

  it('throws when id does not exist', async () => {
    await expect(Fake.findById(1)).rejects.toThrow()
  })

  it('fetches one entity', async () => {
    const newEntity = await Fake.insert({})

    const entity = await Fake.findOne(newEntity)
    expect(entity).toBeDefined()
  })

  it('throws when invalid params in findOne', async () => {
    await expect(Fake.findOne(1)).rejects.toThrow()
  })

  it('throws when disabled methods are called', async () => {
    const newEntity = await Fake.insert({})
    expect(() => {
      newEntity.save()
    }).toThrow()
    expect(() => {
      newEntity.saveGraph()
    }).toThrow()
    //  eslint-disable-next-line
    await expect(newEntity._save()).rejects.toThrow()
    expect(() => {
      //  eslint-disable-next-line
      newEntity._updateProperties()
    }).toThrow()

    expect(() => {
      newEntity.updateProperties()
    }).toThrow()

    expect(() => {
      newEntity.setOwners()
    }).toThrow()

    expect(() => {
      Fake.findByField()
    }).toThrow()
    await expect(Fake.findOneByField()).rejects.toThrow()
    await expect(Fake.all()).rejects.toThrow()
    await expect(newEntity.delete()).rejects.toThrow()
  })

  it('patches entity with provided data', async () => {
    const newEntity = await Fake.insert({})
    const affectedRows = await Fake.patch({ id: newEntity.id, status: 'test' })
    const patchedEntity = await Fake.findById(newEntity.id)
    expect(affectedRows).toEqual(1)
    expect(patchedEntity.status).toEqual('test')
  })

  it('throws when patch called with invalid params', async () => {
    await expect(Fake.patch()).rejects.toThrow()
  })

  it('patches and fetches entity by providing id along with provided data', async () => {
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.patchAndFetchById(newEntity.id, {
      status: 'test',
    })

    expect(patchedEntity.status).toEqual('test')
  })

  it('patches and fetches entity by providing id along with provided data as well as fetches related entities', async () => {
    const user = await createUser()
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.patchAndFetchById(
      newEntity.id,
      {
        status: 'test',
        userId: user.id,
      },
      { related: 'user' },
    )

    expect(patchedEntity.user).toBeDefined()
    expect(patchedEntity.user.id).toEqual(user.id)
  })

  it('throws when patchAndFetchById called with invalid params', async () => {
    await expect(Fake.patchAndFetchById()).rejects.toThrow()
  })

  it('updates entity with provided data', async () => {
    const newEntity = await Fake.insert({})
    const affectedRows = await Fake.update({ id: newEntity.id, status: 'test' })
    const updatedEntity = await Fake.findById(newEntity.id)
    expect(affectedRows).toEqual(1)
    expect(updatedEntity.status).toEqual('test')
  })

  it('throws when update called with invalid params', async () => {
    await expect(Fake.update()).rejects.toThrow()
  })

  it('updates and fetches entity by providing id along with provided data', async () => {
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.updateAndFetchById(newEntity.id, {
      status: 'test',
    })

    expect(patchedEntity.status).toEqual('test')
  })

  it('updates and fetches entity by providing id along with provided data as well as fetches related entities', async () => {
    const user = await createUser()
    const newEntity = await Fake.insert({})

    const patchedEntity = await Fake.updateAndFetchById(
      newEntity.id,
      {
        status: 'test',
        userId: user.id,
      },
      { related: 'user' },
    )

    expect(patchedEntity.user).toBeDefined()
    expect(patchedEntity.user.id).toEqual(user.id)
  })

  it('throws when updateAndFetchById called with invalid params', async () => {
    await expect(Fake.updateAndFetchById()).rejects.toThrow()
  })

  it('deletes entities based on id', async () => {
    const newEntity = await Fake.insert({})
    const affectedRows = await Fake.deleteById(newEntity.id)
    const entities = await Fake.find()
    expect(affectedRows).toEqual(1)
    expect(entities).toHaveLength(0)
  })

  it('throws when deleteById called with invalid params', async () => {
    await expect(Fake.deleteById()).rejects.toThrow()
  })
})
