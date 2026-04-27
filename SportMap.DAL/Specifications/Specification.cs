using DomainLayer.Common;
using SportMap.DAL.Abstractions;
using System.Linq.Expressions;

namespace SportMap.DAL.Specifications
{
    public abstract class Specification<TData> : ISpecification<TData> where TData : BaseEntity
    {
        public Expression<Func<TData, bool>>? Criteria { get; protected set; }
        public List<Expression<Func<TData, object>>> Includes { get; } = [];
    }
}
