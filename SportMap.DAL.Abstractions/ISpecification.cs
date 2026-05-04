using DomainLayer.Common;
using System.Linq.Expressions;

namespace SportMap.DAL.Abstractions
{
    public interface ISpecification<TData> where TData : BaseEntity
    {
        public Expression<Func<TData, bool>>? Criteria { get; }
        public List<Expression<Func<TData, object>>> Includes { get; }
    }
}
