const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('FIR', async function () {
  it('Should create a FIR', async function () {
    const FIR = await ethers.getContractFactory('FIR')
    const fir = await FIR.deploy('FIR')
    await fir.deployed()
    await fir.createComplaint('My first Complaint', '12345')

    const Complaints = await FIR.fetchComplaints()
    console.log(Complaints)
    expect(Complaints[0].title).to.equal('My first Complaint')
  })

  it('Should edit a Complaint', async function () {
    const FIR = await ethers.getContractFactory('FIR')
    const FIR = await FIR.deploy('My FIR')
    await FIR.deployed()
    await FIR.createComplaint('My Second Complaint', '12345')

    await FIR.updateComplaint(1, 'My updated Complaint', '23456', true)

    Complaints = await FIR.fetchComplaints()
    expect(Complaints[0].title).to.equal('My updated Complaint')
    console.log(Complaints)
  })

  it('Should add update the name', async function () {
    const FIR = await ethers.getContractFactory('FIR')
    const FIR = await FIR.deploy('My FIR')
    await FIR.deployed()

    expect(await FIR.name()).to.equal('My FIR')
    await FIR.updateName('My new FIR')
    expect(await FIR.name()).to.equal('My new FIR')
    console.log(Complaints)
  })
})
