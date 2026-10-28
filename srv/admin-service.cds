
using { psa.master as master } from '../db/schema';

//@path: 'admin'
@(requires:'Admin')

service AdminService {
    entity Employees as projection on master.Employees;
    entity Clients as projection on master.Clients;
    entity Departments as projection on master.Departments;
}
