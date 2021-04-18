using System.IO;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services.Interfaces
{
    public interface ICovidDataClient
    {
        Task<Stream> GetInfectionLevelsOnDistrictLevelAsync();
    }
}
