using ermitsognnedeFunctions.Models;
using ermitsognnedeFunctions.Services.Interfaces;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace ermitsognnedeFunctions.Services
{
    public class ZipArchiveService : IZipArchiveService
    {
        public async Task<List<FileModel>> GetDistictData(Stream zipArchiveStream)
        {
            var results = new List<FileModel>();

            using (var archive = new ZipArchive(zipArchiveStream))
            {
                var districtEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("sognedata-covid-19"));
                if (districtEntry == null)
                    districtEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("sognedata"));
                if (districtEntry == null)
                    districtEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("graensevaerdier_sogn"));

                var districtMemStream = new MemoryStream();
                await districtEntry.Open().CopyToAsync(districtMemStream);

                var districtFileModel = new FileModel
                {
                    FileDataType = FileDataType.DistrictData,
                    FileName = districtEntry.FullName,
                    Stream = districtMemStream
                };
                results.Add(districtFileModel);

                var municipalityEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("incidenser_kommuner"));

                if (municipalityEntry == null)
                    municipalityEntry = archive.Entries.FirstOrDefault(x => x.Name.Contains("graensevaerdier_kommune"));

                if (municipalityEntry != null)
                {
                    var municipalityMemStream = new MemoryStream();
                    await municipalityEntry.Open().CopyToAsync(municipalityMemStream);

                    var municipalityFileModel = new FileModel
                    {
                        FileDataType = FileDataType.Municipality,
                        FileName = municipalityEntry.FullName,
                        Stream = municipalityMemStream
                    };
                    results.Add(municipalityFileModel);
                }
            }

            return results;
        }
    }
}
