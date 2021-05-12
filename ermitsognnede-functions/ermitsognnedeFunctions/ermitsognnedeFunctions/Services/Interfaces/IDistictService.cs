using ermitsognnedeFunctions.Models;
using System.Collections.Generic;

namespace ermitsognnedeFunctions.Services.Interfaces
{
    public interface IDistictService
    {
        List<DistrictDataJsonModel> GetDistrictDataJsonModels(FileModel fileModel);
    }
}
