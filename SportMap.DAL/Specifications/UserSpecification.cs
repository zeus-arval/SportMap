using System.Linq.Expressions;
using DomainLayer.Entities;
using SportMap.DAL.Abstractions.Repositories;

namespace SportMap.DAL.Specifications
{
    public class UserSpecification : Specification<User>
    {
        public UserSpecification(GetUsersParameters parameters)
        {
            Includes.Add(user => user.Personalization);
            Includes.Add(user => user.UserRole);
        }

        public UserSpecification(List<Expression<Func<User, object>>> includes, Expression<Func<User, bool>> criteria = null)
        {
            Criteria = criteria;
    
            Includes.AddRange(includes);
        }
    }
}
